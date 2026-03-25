
using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{

    public class UserProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? PhoneNumber { get; set; }
        [Required]
        public string FullName { get; set; }
        [Required]
        public string Department { get; set; }
        public string? GitHubLink { get; set; }
        public string? LinkedinLink { get; set; }
        public string? Field { get; set; }
        public int TotalNumOfCreditCards { get; set; }
        [Required]
        public string PersonalEmail { get; set; }   
        public bool IsGraduate { get; set; }
        public int? MaxTeams { get; set; }  // only for supervisors

        public User User { get; set; }
    }
}
