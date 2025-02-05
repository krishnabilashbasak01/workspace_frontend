import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks_in_queue : [],
    selected_task : null
}

const tasksInQueueSlice = createSlice({
    name: "tasks_in_queue",
    initialState,
    reducers:{
        setTasksInQueue: (state, action) => {
            state.tasks_in_queue = action.payload;
        },
        updateTasksInQueue: (state, action) => {
            if (state.tasks_in_queue) {
                state.tasks_in_queue = action.payload
            }
        },
        setSelectedTask: (state, action)=>{
            state.selected_task = action.payload
        },
        updateSelectedTask: (state, action) => {
            if(state.selected_task){
                state.selected_task = action.payload
            }
        }

    }
})

export const {setTasksInQueue, updateTasksInQueue, setSelectedTask, updateSelectedTask} = tasksInQueueSlice.actions;
export default tasksInQueueSlice.reducer;