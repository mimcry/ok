 export const getRoomId =(userId1:string,userId2:string) =>{
    const sortedIds =[userId1, userId2].sort();
    const roomId =sortedIds.join('-');
    return roomId
}