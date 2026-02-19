import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Modal, ModalProps, Platform } from 'react-native';

// MyModal wraps the React Native Modal with the same API
// and implements a fix for iOS issues with multiple modals
const MyModal = forwardRef<any, ModalProps>((props, ref) => {
    const {
        visible,
        onShow,
        onDismiss,
        ...otherProps
    } = props;

    // Forward the ref to access the underlying Modal methods
    const modalRef = useRef<any>(null);
    useImperativeHandle(ref, () => ({
        ...(modalRef.current || {}),
    }));

    // Workaround for iOS modal issues
    const [innerVisible, setInnerVisible] = useState(visible);
    const [alreadyVisible, setAlreadyVisible] = useState(false);

    const handleDismiss = React.useCallback(() => {
        setAlreadyVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    }, [onDismiss]);

    const handleShow = React.useCallback((e: any) => {
        setAlreadyVisible(true);
        if (onShow) {
            onShow(e);
        }
    }, [onShow]);

    React.useEffect(() => {
        // If Modal UI is not yet visible and needs to be shown, set internal state to visible
        if (!alreadyVisible && visible) {
            setInnerVisible(true);
        }
        // If Modal UI is already visible and needs to be hidden, set internal state to not visible
        if (alreadyVisible && !visible) {
            setInnerVisible(false);
        }
    }, [handleDismiss, alreadyVisible, visible]);

    return (
        <Modal
            ref={modalRef}
            visible={Platform.OS === 'ios' ? innerVisible : visible}
            onShow={handleShow}
            onDismiss={handleDismiss}
            {...otherProps}
        />
    );
});

export default MyModal;
