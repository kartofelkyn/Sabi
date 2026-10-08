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
    }
}