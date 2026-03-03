
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{

    /// Stores additional academic information for students only.
    public class StudentProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }

        public string FullName { get; set; }

        public string Department { get; set; }

        public int TotalNumOfCreditCards { get; set; }

        public bool IsGraduate { get; set; }

        public User User { get; set; }
    }
}
