using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class RegistrationRequest
    {
        [Key]
        public int Id { get; set; }
        public string UniversityEmail { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}