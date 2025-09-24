'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  onConfirmLeave?: () => void;
  onCancelLeave?: () => void;
  message?: string;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  onConfirmLeave,
  onCancelLeave,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesOptions) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter();
  const originalPush = useRef(router.push);
  const originalBack = useRef(router.back);
  const originalReplace = useRef(router.replace);

  const handleNavigation = useCallback((url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(url);
      setShowConfirmModal(true);
    } else {
      originalPush.current(url);
    }
  }, [hasUnsavedChanges]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingNavigation('back');
      setShowConfirmModal(true);
    } else {
      originalBack.current();
    }
  }, [hasUnsavedChanges]);

  const handleReplace = useCallback((url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(url);
      setShowConfirmModal(true);
    } else {
      originalReplace.current(url);
    }
  }, [hasUnsavedChanges]);

  const confirmLeave = useCallback(() => {
    setShowConfirmModal(false);
    if (pendingNavigation === 'back') {
      originalBack.current();
    } else if (pendingNavigation) {
      originalPush.current(pendingNavigation);
    }
    setPendingNavigation(null);
    onConfirmLeave?.();
  }, [pendingNavigation, onConfirmLeave]);

  const cancelLeave = useCallback(() => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
    onCancelLeave?.();
  }, [onCancelLeave]);

  // Handle browser back/forward and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setPendingNavigation('back');
        setShowConfirmModal(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message]);

  // Override router methods
  useEffect(() => {
    router.push = handleNavigation;
    router.back = handleBack;
    router.replace = handleReplace;

    return () => {
      router.push = originalPush.current;
      router.back = originalBack.current;
      router.replace = originalReplace.current;
    };
  }, [router, handleNavigation, handleBack, handleReplace]);

  return {
    showConfirmModal,
    setShowConfirmModal,
    confirmLeave,
    cancelLeave,
    message
  };
}
