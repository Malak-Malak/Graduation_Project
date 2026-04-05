using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class ProjectFile
    {
        [Key]   
        public int Id { get; set; }
        public string FilePath { get; set; }
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; }
        public int TeamId { get; set; }
        public int UserId { get; set; }
        public Team Team { get; set; }
        public User User { get; set; }
    }
}