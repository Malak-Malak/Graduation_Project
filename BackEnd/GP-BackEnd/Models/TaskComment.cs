
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GPMS.Domain.Entities
{
    /// Represents comments and replies on tasks.

    public class TaskComment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Content { get; set; } 

        public DateTime CreatedAt { get; set; }

        [ForeignKey("Task")]
        public int TaskId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        /// Self-reference for replies (nullable).

        public int? ParentCommentId { get; set; }

        public TaskItem Task { get; set; }
        public User User { get; set; }

        public TaskComment ParentComment { get; set; }
        public ICollection<TaskComment> Replies { get; set; }
    }
}
