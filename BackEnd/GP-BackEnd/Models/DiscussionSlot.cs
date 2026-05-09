using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class DiscussionSlot
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateTime { get; set; }
        public string Location { get; set; }
        public string? Notes { get; set; }
        public int HeadOfDepartmentId { get; set; }
        public string Department { get; set; }
        public User HeadOfDepartment { get; set; }
        public ICollection<TeamDiscussionSlot> TeamSlots { get; set; }
    }
}