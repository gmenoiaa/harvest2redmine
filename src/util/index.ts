export function extractErrorMsg(reason: any) {
    let msg = reason;
    // if (reason.error !== undefined) {
    //     msg = reason.error;
    //     const error = JSON.parse(reason.error);
    //     if (error !== undefined) {
    //         msg = error.message;
    //     }
    // }
    return msg;
}
