
using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.Models
{

    /// Stores additional academic information for students only.
    public class UserProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PhoneNumber { get; set; }
        public string FullName { get; set; }

        public string Department { get; set; }
        public string? field { get; set; }
        public int TotalNumOfCreditCards { get; set; }

        public bool IsGraduate { get; set; }
        public int? MaxTeams { get; set; }  // only for supervisors

        public User User { get; set; }
    }
}
