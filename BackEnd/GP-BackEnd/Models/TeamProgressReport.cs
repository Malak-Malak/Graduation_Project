
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
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

        [ForeignKey("Team")]
        public int TeamId { get; set; }

        public Team Team { get; set; }
    }
}
