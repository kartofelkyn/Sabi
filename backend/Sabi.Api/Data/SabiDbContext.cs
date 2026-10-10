using Microsoft.EntityFrameworkCore;
using Sabi.Api.Models;

namespace Sabi.Api.Data
{
    public class SabiDbContext : DbContext
    {
        public SabiDbContext(DbContextOptions<SabiDbContext> options)
            : base(options)
        {
        }

        public DbSet<Account> Accounts => Set<Account>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.Property(a => a.InitialBalance)
                    .HasPrecision(18, 2);

                entity.Property(a => a.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(a => a.Currency)
                    .HasMaxLength(3)
                    .IsRequired();

            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(c => c.Name)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.HasIndex(c => new { c.Name, c.Type })
                    .IsUnique();
            });

            modelBuilder.Entity<Transaction>(entity =>
           {
               entity.Property(t => t.Amount)
                   .HasPrecision(18, 2);

               entity.Property(t => t.Description)
                   .HasMaxLength(500);

               entity.HasOne(t => t.Account)
                   .WithMany(a => a.Transactions)
                   .HasForeignKey(t => t.AccountId)
                   .OnDelete(DeleteBehavior.Restrict);

               entity.HasOne(t => t.Category)
                   .WithMany(c => c.Transactions)
                   .HasForeignKey(t => t.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);
           });
        }
    }
}