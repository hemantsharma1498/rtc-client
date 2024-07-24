import React from 'react';

const OrganisationList = ({ organisations, selectedOrg, onSelectOrg }) => {
  return (
    <div className="organisation-list">
      {organisations.map(org => (
        <div
          key={org.Organisation}
          className={`organisation-item ${selectedOrg === org.Organisation ? 'selected' : ''}`}
          onClick={() => onSelectOrg(org.Organisation)}
        >
          {org.Organisation.replace(/[^a-zA-Z0-9]/g, ' ')} {/* Replacing special chars */}
        </div>
      ))}
    </div>
  );
};

export default OrganisationList;
