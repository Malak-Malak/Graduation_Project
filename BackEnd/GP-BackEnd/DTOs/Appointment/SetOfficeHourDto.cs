namespace GP_BackEnd.DTOs.Appointment
{
    public class SetOfficeHourDto
    {
        public string DayOfWeek { get; set; }   // e.g. "Sunday", "Monday"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsOnline { get; set; }

    }
}
