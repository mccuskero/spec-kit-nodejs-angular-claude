using Microsoft.Extensions.DependencyInjection;
using OrchardCore.Modules;

namespace OrchardCore.Media.CustomAPI
{
    public class Startup : StartupBase
    {
        public override void ConfigureServices(IServiceCollection services)
        {
            // Services are automatically registered via dependency injection
            // The controller will be discovered automatically
        }
    }
}
