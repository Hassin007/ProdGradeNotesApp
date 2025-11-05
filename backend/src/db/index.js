import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

async function ConnectDB() {
    try {
        const res = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB connected. HOST: ${res.connection.host}`);
    } catch (error) {
        console.log("DB connection failed",error);
        process.exit(1)
    }
    
}

export {ConnectDB}