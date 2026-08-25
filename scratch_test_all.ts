import { Route as IndexRoute } from "./src/routes/index.tsx";
import { Route as ProjectsRoute } from "./src/routes/projects/index.tsx";
import { Route as RenovationRoute } from "./src/routes/renovation.tsx";
import { Route as FitoutRoute } from "./src/routes/fitout.tsx";
import { Route as DigitalRoute } from "./src/routes/digital.tsx";
import { Route as PackagesRoute } from "./src/routes/packages.tsx";
import { Route as MethodRoute } from "./src/routes/method.tsx";
import { Route as HealthcareRoute } from "./src/routes/healthcare.tsx";
import { Route as ContactRoute } from "./src/routes/contact.tsx";

console.log("ALL 9 POKIBOIS ROUTES LOADED SUCCESSFULLY:", {
  index: !!IndexRoute,
  projects: !!ProjectsRoute,
  renovation: !!RenovationRoute,
  fitout: !!FitoutRoute,
  digital: !!DigitalRoute,
  packages: !!PackagesRoute,
  method: !!MethodRoute,
  healthcare: !!HealthcareRoute,
  contact: !!ContactRoute,
});
