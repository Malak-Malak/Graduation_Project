using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class TeamDiscussionSlot
    {
        [Key]
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int DiscussionSlotId { get; set; }
        public Team Team { get; set; }
        public DiscussionSlot DiscussionSlot { get; set; }
    }
}