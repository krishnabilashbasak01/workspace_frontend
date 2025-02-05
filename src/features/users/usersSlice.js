import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    users: [],
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        updateUsers: (state, action)=>{
            if(state.users){
                state.users = action.payload;
            }
        }
    }
})

export const {setUsers, updateUsers} = usersSlice.actions;
export default usersSlice.reducer;