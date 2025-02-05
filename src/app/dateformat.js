export const convertIsoStringTodate = (isoString) => {
    const date = new Date(isoString);

    // Extract date and time in a readable format
    const formattedDate = date.toLocaleDateString("en-US"); // YYYY-MM-DD
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }); // HH:MM:SS (24-hour format)

    return { date: formattedDate, time: formattedTime };
  };
