using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class Requirement
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int ProjectId { get; set; }
        public int CreatedByUserId { get; set; }
        public Project Project { get; set; }
        public User CreatedBy { get; set; }
    }
}