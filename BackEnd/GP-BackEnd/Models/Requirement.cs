using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class Requirement
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        //public string? GithubRepo { get; set; }

        public string Priority { get; set; } = "Medium"; // Low, Medium, High
        public string Type { get; set; } = "Functional"; // Functional, Non-Functional
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int TeamId { get; set; }
        public int CreatedByUserId { get; set; }
        public Team Team { get; set; }
        public User CreatedBy { get; set; }
    }
}