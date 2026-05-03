import Swagger from '../utils/jsx/islands/swagger.tsx';

import type { OpenApiResponse } from './api.schema.ts';

/**
 * /api page component.
 *
 * @param props Page props.
 * @param props.data OpenAPI response data.
 */
export default ({ data }: { data: OpenApiResponse }) => <Swagger spec={data} />;
