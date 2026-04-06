namespace GP_BackEnd.DTOs.Appointment
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public DateTime DateTime { get; set; }
        public string Status { get; set; }
        public string? Link { get; set; }
        public bool IsOnline { get; set; }
        public string? Excuse { get; set; }
        public int TeamId { get; set; }
        public string ProjectName { get; set; }
        public int SupervisorId { get; set; }
        public string SupervisorName { get; set; }
    }
}
