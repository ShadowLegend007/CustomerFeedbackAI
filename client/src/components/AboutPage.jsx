import React from 'react';

const teamMembers = [
  { initials: 'AD', name: 'Abhirup Datta Khan', role: 'Project Lead' },
  { initials: 'SM', name: 'Subhodeep Mondal', role: 'Member' },
  { initials: 'BD', name: 'Bhaskar Das', role: 'Member' },
  { initials: 'SM', name: 'Samayeeta Maitra', role: 'Member' },
];

export default function AboutPage() {
  return (
    <div className="page active" id="about">
      <h1 className="section-title">About Us</h1>

      <div className="analyze-form">
        <h3 className="form-title">Our Mission & Vision</h3>
        <p>
          At NeuraGlance, we aim to become the leading platform that bridges the gap
          between product feedback and confident choices. By harnessing the power of
          AI, we revolutionize how people interpret reviews—delivering
        </p>
        <p>
          fast, intelligent, and user-focused insights. Our goal is to simplify
          decision-making in an overwhelming digital world, empowering every user to
          make informed, confident buying decisions with ease.
        </p>
      </div>

      <div className="team-section">
        <h2 className="section-title">Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, idx) => (
            <div className="team-member" key={idx}>
              <div className="team-member-img">{member.initials}</div>
              <div className="team-member-info">
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

