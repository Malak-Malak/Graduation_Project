namespace GP_BackEnd.DTOs.Appointment
{
    public class RespondToAppointmentDto
    {
        public int AppointmentId { get; set; }
        public bool IsApproved { get; set; }
        public string? Link { get; set; }
    }
}
