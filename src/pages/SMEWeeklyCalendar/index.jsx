import { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
import WeeklyCalendar from '../../components/app/WeeklyCalendar';
const SMEWeeklyCalendar = () => {
    const user = useSelector((state) => state.auth.user);

    return (<>
        {user && <WeeklyCalendar smeId={user._id} />}
    </>)
}
export default SMEWeeklyCalendar;