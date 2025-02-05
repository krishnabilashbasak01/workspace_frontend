import { useEffect, } from "react";
import { format, isToday, isSameDay, } from "date-fns";
import {
    Card,
} from "@/components/ui/card";
import { ChevronLeftCircle, ChevronRightCircle, Loader2, } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Calendar = ({ client, selectedDate, setSelectedDate, currentMonth,
    setCurrentMonth, calendarLoading, calendar, weekDays,
    handlePrevMonth, handleNextMonth, selectedTasks, setSelectedTasks,
    setSelectedWeeklyCalendar }) => {

    const { toast } = useToast();

    // Get Day Name
    const getDayName = (day) => {
        switch (day) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            default:
                return "Sunday";
        }
    }



    if (calendarLoading) {
        return (
            <Loader2 className={`animate-spin`} />
        );
    }


    return (
        <>
            <Card className={`p-2`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-2 pt-4">
                    <button
                        onClick={handlePrevMonth}
                        className="hover:bg-zinc-100 hover:text-black p-2 rounded"
                    >
                        <ChevronLeftCircle />
                    </button>
                    <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                    <button
                        onClick={handleNextMonth}
                        className="hover:bg-zinc-100 hover:text-black p-2 rounded"
                    >
                        <ChevronRightCircle />
                    </button>
                </div>


                {/* Weekday Names */}
                <div className="grid grid-cols-7 gap-1 text-center font-medium text-black dark:text-white">
                    {weekDays?.map((day) => (
                        <div key={day} className={`bg-blue-200 dark:bg-zinc-700 rounded py-1`}>{day}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center mt-2">
                    {calendar?.map(({ day, tasks }, index) => {
                        const workInProgressTasksCount = tasks?.filter(task => task.status.name === "Work In Progress" || task.status.name === "Rework In Progress").length || 0;
                        return (<div
                            onClick={() => {


                                let _dayName = getDayName(new Date(day).getDay());
                                if (tasks) {
                                    // console.log(tasks);
                                    setSelectedTasks(tasks);
                                }
                                if (!client?.weeklyCalendar?.find(({ dayOfWeek }) => dayOfWeek === _dayName)) {
                                    setSelectedDate(new Date(day));
                                    setSelectedWeeklyCalendar(null);
                                    toast({
                                        title: "Error",
                                        description: "This date not in weekly calender. If you want it so contact with admin",
                                        variant: "destructive"
                                    })
                                } else {
                                    setSelectedDate(new Date(day));
                                    setSelectedWeeklyCalendar(client?.weeklyCalendar?.find(({ dayOfWeek }) => dayOfWeek === _dayName));
                                    // console.log(client?.weeklyCalendar?.find(({ dayOfWeek }) => dayOfWeek === _dayName));
                                    // onTaskModalChange();
                                }

                            }}
                            key={`day_${index}`}
                            className={`w-full p-1 flex justify-center items-center`}
                        >

                            {/*    Round Circle*/}
                            <div className={`relative`}>
                                <div className={`w-12 h-12 rounded-full flex justify-center items-center
                            cursor-pointer text-lg ${format(day, "MMM") === format(currentMonth, "MMM")
                                        ? "bg-blue-100 dark:bg-zinc-600"
                                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
                                    } ${isToday(day) ? "bg-white dark:bg-white text-green-600" : ""
                                    } ${isSameDay(selectedDate, day)
                                        ? "border border-blue-500"
                                        : ""
                                    }
                            `}>
                                    {format(day, "d")}
                                </div>

                                {/* Task Count*/}
                                {tasks?.length > 0 && (<div
                                    className={`rounded-full w-5 h-5 bg-blue-500 text-sm absolute -top-1 -right-1 text-white `}>{tasks.length}
                                </div>
                                )}

                                {/* Created Task Count */}
                                {workInProgressTasksCount > 0 && (
                                    <div
                                        className={`rounded-full w-5 h-5 bg-green-500 text-sm absolute -top-1 -left-1 text-white    animate-pulse`}>{workInProgressTasksCount}
                                    </div>
                                )}
                            </div>

                        </div>)

                    }

                    )}
                </div>
            </Card>
        </>

    )
}

export default Calendar