import { useEffect, useState } from 'react'
import axios from 'axios';
import { getToken } from '@/hooks/get-token';
import { useNavigate } from 'react-router';

const WeeklyCalendar = ({ smeId }) => {
    const navigate = useNavigate();
    // Define the week days in the proper order
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const [calendarData, setCalendarData] = useState(null)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!calendarData) {
            getSmeWeeklyCalendar();
        }
    }, [calendarData])

    // if sme id exist then calendar data
    const getSmeWeeklyCalendar = async () => {
        if (smeId) {
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_USER_API_SERVER}/api/calendar/sme-calender`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    },
                    params: { smeId: smeId }
                })

                // console.log(response);
                if (response.status === 200) {

                    if (response.data && response.data.length > 0 && response.data[0].days && response.data[0].days.length > 0) {
                        // console.log(response.data[0].days);
                        // setCalendarData(response.data[0].days);
                        const dayClientMap = response.data[0].days.reduce((map, { day, clients }) => {
                            map[day] = clients;
                            return map;
                        }, {});

                        setCalendarData(dayClientMap);

                    }
                }

            } catch (error) {
                console.log(error);

            } finally {
                setIsLoading(false)
            }
        }
    }
    return (<div className='p-4'>
        {calendarData && <table className='w-full border-collapse border border-slate-500'>
            <thead>
                <tr>
                    {weekDays.map((day) => (
                        <th key={day} className="border border-slate-600">
                            {day}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {weekDays.map((day) => (
                        <td key={day} className="border border-slate-600" >
                            <div className='flex flex-col px-1 justify-start h-full py-2'>
                                {calendarData[day]?.length > 0 ? (
                                    calendarData[day].map((client, index) => (
                                        <div key={index} className='flex flex-row mb-2 cursor-pointer border-[1px] border-zinc-600 rounded p-1'
                                            onClick={() => {
                                                navigate(`/client/edit/${client.id}`);
                                            }}
                                        >

                                            <img
                                                src={client.profilePicture}
                                                alt={`${client.name}'s profile`}
                                                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                                            />
                                            <div className="flex flex-col justify-center">
                                                <strong>{client.businessName.split(' ')[0]}</strong>
                                                <div className={`flex flex-row justify-between items-center gap-3`}>
                                                    <p className='text-xs font-mono'>{client.username}</p>
                                                    <p style={{ margin: 0, fontSize: "12px", color: "gray" }}>
                                                        {client.type}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <p>No clients</p>
                                )}
                            </div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>}
    </div>)
}
export default WeeklyCalendar;