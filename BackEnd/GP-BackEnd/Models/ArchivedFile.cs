using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class ArchivedFile
    {
        [Key]
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int Version { get; set; }  // 0 = Phase 1, 1 = Phase 2
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string? Description { get; set; }
        public Team Team { get; set; }
    }
}