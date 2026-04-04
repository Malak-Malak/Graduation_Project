using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GP_BackEnd.Models
{

    /// Represents system notifications for users.

    public class Notification
    {
        [Key]
        public int Id { get; set; }
        public int Version { get; set; } = 0;
        public string Title { get; set; }

        public string Message { get; set; }

        public DateTime CreatedAt { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public User User { get; set; }
    }
}
