namespace GP_BackEnd.DTOs.Appointment
{
    public class OfficeHourDto
    {
        public int Id { get; set; }
        public string DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string SupervisorName { get; set; }
    }
}
