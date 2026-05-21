import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Read env
dotenv.config()                      
const PORT = process.env.PORT || 4000

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Event analytics backend is running"
    })
})

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})


