using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class UniversityRecord
    {
        [Key]
        public int Id { get; set; }
        public string UniversityEmail { get; set; }
        public string Username { get; set; }        
        public string Password { get; set; }       
        public string FullName { get; set; }
        public string Role { get; set; }           
        public string Department { get; set; }
        public bool IsGraduate { get; set; }         
    }
}