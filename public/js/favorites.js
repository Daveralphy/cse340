// Favorite Button Handler
document.addEventListener('DOMContentLoaded', function() {
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', async function() {
      const invId = this.getAttribute('data-inv-id');
      const isFavorited = this.getAttribute('data-is-favorited') === 'true';
      const endpoint = isFavorited ? '/favorites/remove' : '/favorites/add';
      
      // Show loading state
      this.disabled = true;
      this.classList.add('loading');
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inv_id: parseInt(invId) })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Update button state
          const newState = !isFavorited;
          const newTitle = newState ? 'Remove from Saved' : 'Save Vehicle';
          
          // Update icon class
          if (newState) {
            this.classList.add('icon-heart-filled');
            this.classList.remove('icon-heart');
          } else {
            this.classList.remove('icon-heart-filled');
            this.classList.add('icon-heart');
          }
          
          this.setAttribute('data-is-favorited', newState);
          this.setAttribute('title', newTitle);
          
          // Show success message
          showNotification(data.message, 'success');
        } else {
          showNotification(data.message || 'An error occurred', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred. Please try again.', 'error');
      } finally {
        this.disabled = false;
        this.classList.remove('loading');
      }
    });
  }
});

// Helper function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.insertBefore(notification, document.body.firstChild);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
