import { data } from "react-router-dom";

 export default function Reducer(state={user:{data:{},loged:false}},action){
   if(action.type=="user"){
        return({
            user: {
                data: action.user.data,
                loged: true
            },
        })
    }else if(action.type=="userLogout"){
        return({
            user: {
                data: action.user.data,
                loged: false
            },
        })
    }
 }