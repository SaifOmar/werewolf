import app from '../app';
import { Manager } from '../entities/manager';

const manager = new Manager();
const server = app.listen(3000, () => {
      console.log('Server is running on port 3000');
});
export { manager, server };
