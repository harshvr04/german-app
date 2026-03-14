interface Props {
	visible: boolean;
	onClose: () => void;
	onReset: () => void;
	message: string;
}

export function InfoModal({ visible, onClose, onReset, message }: Props) {
	if (!visible) return null;

	return (
		<div
			className="modal-overlay"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
		>
			<div
				className="modal-card"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="modal-title">Words Encountered</div>
				<div className="modal-body">{message}</div>
				<button className="modal-reset-btn" type="button" onClick={onReset}>
					Reset Counter
				</button>
				<button className="modal-cancel" type="button" onClick={onClose}>
					Close
				</button>
			</div>
		</div>
	);
}
