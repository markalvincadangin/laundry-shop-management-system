package com.highvoltage.laundryms.users;

import com.highvoltage.laundryms.support.AbstractPostgresIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class UserRepositoryIT extends AbstractPostgresIT {

    @Autowired UserRepository userRepository;

    @Test
    void saves_and_finds_by_username() {
        User u = new User(null, "Mark", "Alvin", "staff1", "hash", Role.STAFF);
        userRepository.save(u);

        var found = userRepository.findByUsername("staff1");
        assertThat(found).isPresent();
        
        User savedUser = found.get();
        assertThat(savedUser.getUsername()).isEqualTo("staff1");
        assertThat(savedUser.getFirstName()).isEqualTo("Mark");
        assertThat(savedUser.getLastName()).isEqualTo("Alvin");
        assertThat(savedUser.getPasswordHash()).isEqualTo("hash");
        assertThat(savedUser.getRole()).isEqualTo(Role.STAFF);
    }

    @Test
    void username_must_be_unique() {
        userRepository.save(new User(null, "A", "B", "dup", "hash1", Role.STAFF));

        assertThatThrownBy(() ->
                userRepository.saveAndFlush(new User(null, "C", "D", "dup", "hash2", Role.STAFF))
        ).isInstanceOf(Exception.class); // keep generic; provider exception differs
    }
}
