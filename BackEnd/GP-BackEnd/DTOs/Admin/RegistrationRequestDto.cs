namespace GP_BackEnd.DTOs.Admin
{
    public class RegistrationRequestDto
    {
        public int Id { get; set; }
        public string UniversityEmail { get; set; }
        public string Status { get; set; }
        public DateTime RequestedAt { get; set; }
    }
}