import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken'
// @ts-ignore
import { JWT_SECRET } from '@repo/backend-common/config'

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []
const wss = new WebSocketServer({ port: 8080 })

function CheckUser(token: string): string | null {
    try{
        if (!token) {
            return null;
        }
    
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            return decoded.userId || null;
        } catch (error) {
            console.error("Token verification failed:", error);
            return null;
        }
    }catch(e){
        return null;
    }

    }

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;

    }

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') || ""
    const userId = CheckUser(token)
    if (userId == null) {
        ws.close()
        return;

    }
    users.push({
        ws,
        userId,
        rooms: []
    })
    const decoded = jwt.verify(token, JWT_SECRET)
    if (typeof (decoded) == "string") {
        ws.close()
        return
    }
    if (!decoded || !(decoded).userId)
        ws.on("message", function message(data) {
            const parsedData = JSON.parse(data as unknown as string);
            if (parsedData.type === 'join_room') {
                const user = users.find(x => x.ws === ws);
                user?.rooms.push(parsedData.roomId)
            }
            if (parsedData.type === 'leave_room') {
                const user = users.find(x => x.ws === ws);
                if (!user) {
                    return;
                }
                user?.rooms.filter(x => x === parsedData.room)
            }
            if (parsedData.type === 'chat') {
                const roomId =parsedData.roomId;
                const message=parsedData.message;
                users.forEach(user=>{
                    if(user.rooms.includes(roomId)){
                        user.ws.send(JSON.stringify({
                            type:'chat',
                            message:message,
                            roomId:roomId
                        }))
                    }
                })
            }
        })
})