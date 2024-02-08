import * as dotenv from 'dotenv';

dotenv.config();

import express ,{Request,Response} from 'express';
import http from 'http';
import WebSocket from 'ws'; 
import { Server as WebSocketServer } from 'ws'; 
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin,authenticateUser,authenicatedRequest } from './middleware/authenticate';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from'cors';

const app = express();
const server = http.createServer(app);
const wss: WebSocketServer = new WebSocket.Server({ server }); 
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

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
    
    const token =jwt.sign(email,process.env.JWT_SECRET||'');
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
    
    const token =jwt.sign(email,process.env.JWT_SECRET||'');
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
        const token = jwt.sign( email , process.env.JWT_SECRET || '');
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
        const token = jwt.sign( email , process.env.JWT_SECRET || '');
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
        res.json({ type: 'meeting-created', code:meeting.code });
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
    } else {
      res.json({ type: 'error', message: 'Invalid room code' });
    }
  } catch (error) {
    console.error('Error handling join message:', error);
  }
})

app.get('/user',authenticateUser,(req:authenicatedRequest,res:Response)=>{
const userId=req.user?.id;
res.json({userId});
})

wss.on('connection', (ws) => {
    try {
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (!message || !message.type) {
                    console.error('Invalid message format:', message);
                    return;
                }

                if (message.type === 'upvote') {
                    await handleUpvoteMessage(ws, message);
                } else if (message.type === 'sendMessage') {
                    await handleSendMessage(ws, message);
                } else {
                    console.error('Unsupported message type:', message.type);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        ws.on('close', () => {
            handleDisconnect(ws);
        });
    } catch (error) {
        console.error('Error handling WebSocket connection:', error);
    }
});

const handleUpvoteMessage = async (ws: WebSocket, message: any) => {
  const { messageId, userId } = message;
  try {
    const existingMessage = await prisma.message.findUnique({ where: { id: messageId } });
    if (existingMessage && existingMessage.authorId !== userId) {
      const updatedMessage=await prisma.message.update({
        where: { id: messageId },
        data: {
          upvotes: existingMessage.upvotes + 1,
        },
      });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'upvote',
            messageId: messageId,
            upvotes: updatedMessage.upvotes,
          }));
        }
      });
    }
  } catch (error) {
    console.error('Error handling upvote message:', error);
  }
};

const handleSendMessage= async(ws:WebSocket,message:any)=>{
const {content,userId}=message;
try {
    const createdMessage = await prisma.message.create({
      data: {
        content,
        author: { connect: { id: userId } }
      }
    });
    wss.clients.forEach((client) => {
        if ( client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            message: createdMessage,
          }));
        }
      });
    console.log('Message created:', createdMessage);
  } catch (error) {
    console.error('Error creating message:', error);
  }
  
}
const handleDisconnect = (ws: WebSocket) => {
  // Clean up if needed
};

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
