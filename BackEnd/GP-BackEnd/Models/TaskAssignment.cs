using System.ComponentModel.DataAnnotations;
namespace GP_BackEnd.Models
{
    public class TaskAssignment
    {
        [Key]
        public int Id { get; set; }
        public int TaskItemId { get; set; }
        public int UserId { get; set; }
        public TaskItem TaskItem { get; set; }
        public User User { get; set; }
    }
}