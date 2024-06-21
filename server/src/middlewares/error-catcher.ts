import { sendError } from '../utils/http'

export const errorCatcher = (err: any, req: any, res: any, next: any) => {
    console.error("Error caught by middleware:\n", err)
    sendError(res, 'Unknown server error.', 500);
}