import * as dotenv from 'dotenv';

dotenv.config();

import express ,{Request,Response} from 'express';
import http from 'http';
import WebSocket from 'ws'; 
import { Server as WebSocketServer } from 'ws'; 
import { Prisma,PrismaClient } from '@prisma/client';
import { authenticateAdmin,authenticateUser,authenicatedRequest } from './middleware/authenticate';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from'cors';

const app = express();
const server = http.createServer(app);
const wss: WebSocketServer = new WebSocket.Server({ server }); 
const prisma = new PrismaClient();
const secretKey=process.env.JWT_SECRET||'';
app.use(express.json());
app.use(cors());

const connectedClients = new Set();

app.post('/user/signup',async(req:Request,res:Response)=>{
    const{email,name,password}=req.body;
    const user=await prisma.user.findFirst({where:{email}});
    if(user){
        return res.status(400).json({message:'User already exists!'})
    }
    const hashedPassword=await bcrypt.hash(password,10);

    const newUser =await prisma.user.create({
        data:{
            email,
            name,
            hashedPassword
        }
    })
    
    const token =jwt.sign({email},secretKey,{expiresIn:'1h'});
    res.json({message:'User created successfully',token})
})

app.post('/admin/signup',async(req:Request,res:Response)=>{
    const{email,name,password}=req.body;
    const admin=await prisma.admin.findFirst({where:{email}});
    if(admin){
        return res.status(400).json({message:'Admin already exists!'})
    }
    const hashedPassword=await bcrypt.hash(password,10);

    const newAdmin =await prisma.admin.create({
        data:{
            email,
            name,
            hashedPassword
        }
    })
    
    const token =jwt.sign({email},secretKey,{expiresIn:'1h'});
    res.json({message:'Admin created successfully',token})
})

app.post('/user/signin',async(req:Request,res:Response)=>{
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword || '');
      if (passwordMatch) {
        const token = jwt.sign( {email} , secretKey,{expiresIn:'1h'});
        res.json({ message: 'Signin successful', token });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error signing in user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    } 
})
app.post('/admin/signin',async(req:Request,res:Response)=>{
    const { email, password } = req.body;
    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const passwordMatch = await bcrypt.compare(password, admin.hashedPassword || '');
      if (passwordMatch) {
        const token = jwt.sign( {email} , secretKey,{expiresIn:'1h'});
        res.json({ message: 'Signin successful', token });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error signing in user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    } 
})

app.post('/admin/create-meeting', authenticateAdmin, async (req: authenicatedRequest, res: Response) => {
    const  admin  = req.admin;
    const adminId=admin?.id;
    const {topic,description}=req.body;
    const code = Math.floor(Math.random() * 10000).toString();

    try {
        const meeting = await prisma.meeting.create({
            data: {
                topic,
                description,
                code: code,
                admin: { connect: { id: adminId } },
            },
        });
        res.json({ type: 'meeting-created', code:meeting.code,meetingId:meeting.id });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ type: 'error', message: 'Failed to create meeting' });
    }
});

app.post('/user/joinMeeting',authenticateUser,async(req:authenicatedRequest,res:Response)=>{
const{roomCode}=req.body;
const userId=req.user?.id;
const userName=req.user?.name;
try {
    const meeting = await prisma.meeting.findUnique({ where: { code: roomCode } });
    if (meeting) {
      await prisma.user.update({
        where: { id: userId },
        data: { meeting: { connect: { code: roomCode } } },
      });
      res.json({message:'meeting joined!', meetingId:meeting.id});
    } else {
      return res.json({ type: 'error', message: 'Invalid room code' });
    }
  } catch (error) {
    console.error('Error handling join message:', error);
  }
})

app.get('/user',authenticateUser,(req:authenicatedRequest,res:Response)=>{
const userId=req.user?.id;
const name=req.user?.name
res.json({userId,name});
})

app.get('/messages/:meetingId',async(req,res)=>{
  const meetingId=parseInt(req.params.meetingId);
  
  const messages = await prisma.message.findMany({
    where: {
      meetingId
    }
  });
  
  const updatedMessages = await Promise.all(
    messages.map(async (message) => {
      const author = await prisma.user.findUnique({
        where: { id: message.authorId }
      });
      const name=author?.name;
      return { ...message, author:name};
    })
  );
  
  if(!messages) return res.json({"message":"No messages yet"});
  console.log(updatedMessages)
  res.send(updatedMessages);
})

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  ws.on('message', async (data) => {
    const message = data.toString();

    if (message.startsWith('upvote:')) {
      try {
        const messageId = parseInt(message.split(':')[1]);
        // Find the message in Db and update the upvotes
        
        const updatedMessage = await prisma.message.update({ where: { id: messageId }, data: { upvotes: { increment: 1 } } });
        

        // Broadcast the updated upvote count and message details to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'upvote',
              messageId: messageId,
              upvotes: updatedMessage.upvotes,
            }));
          }
        });
      } catch (error:any) {
        console.error('Error updating upvotes:', error.message);
      }
    } else {
      const messageContent = message.split(':')[0];
      const userId = parseInt(message.split(':')[1]);
      const meetingId = parseInt(message.split(':')[2]);
      
      const messageCreateInput: Prisma.MessageCreateInput = {
        content: messageContent,
        author:{connect:{id:userId}},
        meeting: { connect: { id: meetingId } },
      };
      
      const newMessage = await prisma.message.create({ data: messageCreateInput });
      const author = await prisma.user.findFirst({ where: { id: userId } });
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            message: newMessage,
            author:author?.name,
          }));
        }
      });
    }
  });
  ws.on('close',async()=>{
    connectedClients.delete(ws); // Remove the client from the set when they disconnect

    // if (connectedClients.size === 0) {
    //   // All clients have left, delete data from the database
    //   clearDatabaseData();
    // }
  });
  
});
// async function clearDatabaseData() {
//   try {
//     // Replace 'YourModel' with the actual name of your Prisma model
//     const deletedMessage = await prisma.message.deleteMany();
//     console.log(`Deleted ${deletedMessage.count} rows from the messages table`);
//   } catch (error) {
//     console.error('Error clearing data:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
