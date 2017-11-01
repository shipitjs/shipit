import deploy from './tasks/deploy'
import rollback from './tasks/rollback'
import pending from './tasks/pending'

export default shipit => {
  deploy(shipit)
  rollback(shipit)
  pending(shipit)
}
