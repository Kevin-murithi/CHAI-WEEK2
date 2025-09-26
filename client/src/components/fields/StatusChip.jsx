import PropTypes from 'prop-types'

export default function StatusChip({ status }) {
  const map = { pending: ' Pending', approved: ' Approved', denied: ' Denied', needs_info: ' Needs Info' }
  return <span className="badge">{map[status] || status}</span>
}

StatusChip.propTypes = {
  status: PropTypes.string,
}
