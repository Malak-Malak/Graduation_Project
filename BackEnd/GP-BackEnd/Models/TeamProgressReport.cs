using System.ComponentModel.DataAnnotations;

namespace GP_BackEnd.Models
{
    /// AI-generated progress report for a team.

    public class TeamProgressReport
    {
        [Key]
        public int Id { get; set; }
        public double CompletionRate { get; set; }
        public string RiskLevel { get; set; }
        public string Suggestions { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int TeamId { get; set; }
        public int? ProjectId { get; set; }   
        public Team Team { get; set; }
        public Project Project { get; set; }
    }
}
