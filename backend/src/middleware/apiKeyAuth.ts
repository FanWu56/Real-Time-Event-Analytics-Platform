import { NextFunction, Request, Response } from "express"

const DEMO_API_KEY : Record<string, string>= {
     test_api_key_123: "demo_project_1",
}

// put apiKey here from req.header for convinence
export type AuthenticatedRequest = Request & {projectId? : string, apiKey? : string}

export function apiKeyAuth(req : AuthenticatedRequest, res : Response, next : NextFunction){
    const apiKey = req.header("x-api-key")

    if (!apiKey){
        res.status(401).json("error : invalid api key")
        return
    }

    const projectId = DEMO_API_KEY[apiKey]

    if (!projectId){
        res.status(403).json("error : invalid project id")
        return
    }

    req.projectId = projectId
    req.apiKey = apiKey
    next()
}