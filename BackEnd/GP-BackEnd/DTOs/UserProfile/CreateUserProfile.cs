using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.DTOs.UserProfile
{
    public class CreateUserProfile
    {
        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required]
        [MaxLength(100)]
        public string Department { get; set; }

        [MaxLength(200)]
        public string? GitHubLink { get; set; }

        [MaxLength(200)]
        public string? LinkedinLink { get; set; }

        [MaxLength(100)]
        public string? Field { get; set; }
        [MaxLength(500)]
        public string? Bio { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string PersonalEmail { get; set; }
    }
}