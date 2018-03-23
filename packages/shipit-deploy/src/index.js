import deploy from './tasks/deploy'
import rollback from './tasks/rollback'
import pending from './tasks/pending'

module.exports = shipit => {
  deploy(shipit)
  rollback(shipit)
  pending(shipit)
}
