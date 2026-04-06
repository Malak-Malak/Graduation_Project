namespace GP_BackEnd.DTOs.Appointment
{
    public class UpdateAppointmentDto
    {
        public int AppointmentId { get; set; }
        public int OfficeHourId { get; set; }
        public string Excuse { get; set; }
    }
}
